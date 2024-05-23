import type webpack from "webpack";
import { RunAt, UserscriptPlugin } from "webpack-userscript";
import { readFile } from "node:fs/promises";
const { version } = JSON.parse(await readFile(new URL("package.json", import.meta.url), "utf8")) as { version: string; };

const mode: "none" | "development" | "production" = "production" as never;
export default {
    mode,
    devtool: mode === "development" ? "inline-source-map" : false,
    entry:   new URL("src/index.ts", import.meta.url).pathname,
    output:  {
        path:     new URL("dist", import.meta.url).pathname,
        filename: "script.js"
    },
    plugins: [
        new UserscriptPlugin({
            headers: {
                "name":        "E621 Message Marker",
                "description": "A way to mark e621 messages you haven't responded to yet.",
                version,
                "license":     "MIT",
                "supportURL":  "https://github.com/DonovanDMC/E621MessageMarker/issues",
                "match":       [
                    "https://e621.net/dmails*",
                    "https://e926.net/dmails*"
                ],
                "run-at": RunAt.DocumentBody,
                "grant":  [
                    "GM.getValue",
                    "GM.setValue"
                ],
                "icon":        "https://raw.githubusercontent.com/DonovanDMC/E621MessageMarker/master/icon.png",
                "updateURL":   "https://github.com/DonovanDMC/E621MessageMarker/releases/latest/download/script.meta.js",
                "downloadURL": "https://github.com/DonovanDMC/E621MessageMarker/releases/latest/download/script.user.js"
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?ts/,
                use:  [
                    {
                        loader:  "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    watch:       mode === "development",
    experiments: {
        topLevelAwait: true
    }
} satisfies webpack.Configuration;
