"use server"
import * as Bowser from "bowser"
import { Loghammer, LoghammerErrorLogProps, LoghammerInfoLogProps, LoghammerTrackLogProps } from "@loghammer/base-sdk";

let instance: Loghammer | null = null

function initLoghammer(props: {
    clientId: string,
    clientSecret: string
}) {
    instance = new Loghammer(props)
}

async function createErrorLog(props: LoghammerErrorLogProps) {
    return await instance?.createErrorLog(props)
}

async function createInfoLog(props: LoghammerInfoLogProps) {
    await instance?.createInfoLog(props)
}

async function createTrackLog(props: LoghammerTrackLogProps) {
    await instance?.createTrackLog(props)
}

// This function monkey-patches console.error function to be able to catch error automatically 
async function registerServerSideErrorTracking() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const originalError = console.error
        console.error = async function (message, ...args) {
            if (args.length > 0 && typeof args[0] === "string") {
                const splitted = args[0].split("\n")
                const errorMessage = splitted[0]?.includes("Error") ? splitted[0] : undefined
                const envInfo = Bowser.getParser(window.navigator.userAgent);
                const os = envInfo.getOS().name?.toLowerCase()
                const osVersion = `${envInfo.getOS().versionName} - ${envInfo.getOS().version}`
                const browser = envInfo.getBrowser()
                if (errorMessage) {
                    await createErrorLog({
                        message: errorMessage,
                        stackTrace: args.join("\n"),
                        tags: ["server-side"],
                        data: {
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
                        }
                    })
                }
            }
            originalError(message, args)
        };
    }
}

export { initLoghammer, createErrorLog, createInfoLog, createTrackLog }