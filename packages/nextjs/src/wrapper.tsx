"use client"
import { Fragment, ReactNode, useEffect, version } from "react"
import { createErrorLog } from "./actions"
import * as Bowser from "bowser"

type LoghammerWrapperProps = {
    children: ReactNode | Array<ReactNode>
}

export function LoghammerWrapper(props: LoghammerWrapperProps) {
    useEffect(() => {
        if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
            const defaultBehaviour = console.error
            console.error = async (message: string, params: any) => {
                await errorHandler(message, params)
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
        if(error.message.includes("An error occurred in the Server Components render.")){
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