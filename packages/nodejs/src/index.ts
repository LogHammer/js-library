import { Loghammer } from "@loghammer/base-sdk"


export function registerGlobalErrorHandling(LHInstance: Loghammer, tags: Array<string>) {
    process.on("uncaughtException", async (error: Error, origin) => {
        await LHInstance.createErrorLog({
            message: error.message,
            stackTrace: error.stack,
            tags: tags
        })
    })
}