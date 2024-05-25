import { Base64 } from "js-base64";

type LoghammerInitOptions = {
    clientId: string,
    clientSecret: string
}

export type LoghammerErrorLogProps = {
    // Error message
    message: string,
    // Error stackTrace
    stackTrace?: string | { [key: string]: any },
    // HTTP request
    request?: { [key: string]: any }
    // HTTP response
    response?: { [key: string]: any }
    // More information about this log
    data?: { [key: string]: any }
    // Enviroment info where your app runs
    env?: Env
    // Tags
    tags?: string[]
}

export type LoghammerInfoLogProps = {
    // Message
    message: string,
    // HTTP request
    request?: { [key: string]: any }
    // HTTP response
    response?: { [key: string]: any }
    // Enviroment info where your app runs
    env?: Env
    // More information about this log
    data?: { [key: string]: any }
    // Tags
    tags?: string[]
}

export type LoghammerTrackLogProps = {
    // Message
    message: string,
    // More information about this log
    data?: { [key: string]: any }
    // Tags
    tags?: string[]
}

type Env = {
    os?: "windows" | "macos" | "linux" | "other",
    cpu?: {
        model?: string,
        cores?: number,
        // percentage
        usage?: number
    },
    ram?: {
        total?: number,
        free?: number,
    },
    browser?: {
        name?: string,
        version?: string
    }
}

export class Loghammer {
    options: Partial<LoghammerInitOptions> = {}
    constructor(options: LoghammerInitOptions) {
        this.options = options
    }

    async createErrorLog(props: LoghammerErrorLogProps): Promise<{ status: boolean, data?: string }> {
        const headers = new Headers()
        headers.append("Content-Type", "application/json");
        headers?.append("Authorization", `Basic ${Base64.encode(this.options.clientId + ":" + this.options.clientSecret)}`);
        const req = await fetch("https://api.loghammer.com/api/log/error", {
            method: "post",
            body: JSON.stringify(props),
            headers: headers
        })
        if (req.status === 200) {
            try {
                const responseData = await req.json();
                return responseData
            } catch {
                return {
                    status: false
                }
            }
        } else {
            return {
                status: false
            }
        }
    }

    async createInfoLog(props: LoghammerInfoLogProps) {
        const headers = new Headers()
        headers.append("Content-Type", "application/json");
        headers?.append("Authorization", `Basic ${Base64.encode(this.options.clientId + ":" + this.options.clientSecret)}`);
        const req = await fetch("https://api.loghammer.com/api/log/info", {
            method: "post",
            body: JSON.stringify(props),
            headers: headers
        })
    }

    async createTrackLog(props: LoghammerTrackLogProps) {
        const headers = new Headers()
        headers.append("Content-Type", "application/json");
        headers?.append("Authorization", `Basic ${Base64.encode(this.options.clientId + ":" + this.options.clientSecret)}`);
        const req = await fetch("https://api.loghammer.com/api/log/track", {
            method: "post",
            body: JSON.stringify(props),
            headers: headers
        })
    }
}