"use server"

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

export { initLoghammer, createErrorLog, createInfoLog, createTrackLog }