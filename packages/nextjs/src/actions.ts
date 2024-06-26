"use server"
import * as Bowser from "bowser"
import { Loghammer, LoghammerErrorLogProps, LoghammerInfoLogProps, LoghammerTrackLogProps, LoghammerInitOptions } from "@loghammer/base-sdk";

let instance: Loghammer | null = null

function initLoghammer(props: LoghammerInitOptions) {
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
function registerServerSideErrorTracking() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const originalError = console.error
        console.error = async function (message, ...args) {
            originalError(message, args);
            if (args.length > 0 && typeof args[0] === "string") {
                const splitted = args[0].split("\n");
                const errorMessage = splitted[0]?.includes("Error") ? splitted[0] : undefined;
                if (errorMessage) {
                    createErrorLog({
                        message: errorMessage,
                        stackTrace: args.join("\n"),
                        tags: ["server-side"],
                    });
                }
            } else {
                const err: Error | null = message as any
                if (err) {
                    createErrorLog({
                        message: err.message,
                        stackTrace: err.stack,
                        tags: ["server-side"],
                    });
                }
            }

        };
    }
}

export { initLoghammer, createErrorLog, createInfoLog, createTrackLog, registerServerSideErrorTracking }