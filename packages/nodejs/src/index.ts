import { Loghammer, LoghammerErrorLogProps, LoghammerInfoLogProps, LoghammerTrackLogProps } from "@loghammer/base-sdk"
import os from "os"

let instance: Loghammer | null = null

export function initLoghammer(props: {
    clientId: string,
    clientSecret: string
}) {
    instance = new Loghammer(props)
}

export async function createErrorLog(props: LoghammerErrorLogProps) {
    return await instance?.createErrorLog(props)
}

export async function createInfoLog(props: LoghammerInfoLogProps) {
    await instance?.createInfoLog(props)
}

export async function createTrackLog(props: LoghammerTrackLogProps) {
    await instance?.createTrackLog(props)
}


export function registerGlobalErrorHandling(tags: Array<string>) {
    const defaultBehaviour = console.error
    console.error = async (message: string, params: any) => {
        await errorHandler(message, params)
        defaultBehaviour(message, params)
    }
    process.on("uncaughtException", async (error: Error, origin) => {
        await instance?.createErrorLog({
            message: error.message,
            stackTrace: error.stack,
            tags: tags
        })
    })
}

async function errorHandler(message: any, params: any) {
    const error = Error(message)
    if (message) {
        await createErrorLog({
            message: error.message,
            stackTrace: error.stack,
            tags: ["global-handler"],
            env: {
                os: getOS()
            }
        })
    }
    return true
}

function getOS(){
    const defaultOS = os.platform()
    let result : "windows" | "macos" | "linux" | "other" = "other"
    if(defaultOS === "darwin"){
        result = "macos"
    }else if(defaultOS === "win32"){
        result = "windows"
    }else if(defaultOS === "linux"){
        result = "linux"
    }
    return result
}