"use client"
import { Fragment, ReactNode, useEffect, version } from "react"
import { createErrorLog } from "./actions"
import * as Bowser from "bowser"

type LoghammerWrapperProps = {
    children: ReactNode | Array<ReactNode>
}

export function LoghammerWrapper(props: LoghammerWrapperProps) {
    useEffect(() => {
        // For the client side error catching, we need to make sure window is attached (which means we're working on browser, not on the server.)
        if (typeof window !== "undefined") {
            // Get the default console.error function
            const defaultBehaviour = console.error

            // Monkey-patch the global console.error function
            console.error = async (message: string, params: any) => {
                await errorHandler(message, params)

                // Call the default console.error function
                defaultBehaviour(message, params)
            }
            return () => {
                if (typeof window !== "undefined") {
                    console.error = defaultBehaviour
                }
            }
        }

    }, [])

    async function errorHandler(message: any, params: any) {
        const error = Error(message)

        /*
            Sometimes, Next.js invokes an error multiple times when a single error occurs because of server/client component render purposes.
            In this situation, we need to ensure we pick up the correct error (human-readable, includes stack trace and error). 
            Therefore, we need to ignore errors like 'An error occurred in the Server Components render.' as they are unusable.
        */
        const ignoredMessages: Array<string> = [
            "An error occurred in the Server Components render.",
            "Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
        ]
        if (ignoredMessages.includes(error.message)) {
            return true
        }
        if (message) {
            const envInfo = Bowser.getParser(window.navigator.userAgent);
            const os = envInfo.getOS().name?.toLowerCase()
            const osVersion = `${envInfo.getOS().versionName} - ${envInfo.getOS().version}`
            const browser = envInfo.getBrowser()
            await createErrorLog(JSON.parse(JSON.stringify({
                message: error.message,
                stackTrace: error.stack,
                env: {
                    os: {
                        type: os || "other",
                        version: osVersion
                    },
                    browser: {
                        name: browser.name,
                        version: browser.version
                    }
                },
                tags: ["browser", "client-side"],
                request: { "pathname": document.location.pathname, "origin": document.location.origin }
            })))
        }
        return true
    }

    return (
        <Fragment>
            {props.children}
        </Fragment>
    )
}