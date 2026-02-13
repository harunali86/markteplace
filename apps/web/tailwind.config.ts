import type { Config } from "tailwindcss";
import sharedConfig from "@doossh/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
    content: [
        "./app/**/*.tsx",
        "./components/**/*.tsx",
        "../../packages/ui/src/**/*.tsx",
    ],
    presets: [sharedConfig],
};

export default config;
