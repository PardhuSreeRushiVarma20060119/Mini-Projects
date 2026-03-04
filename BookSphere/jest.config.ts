import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: "<rootDir>/",
    }),
    testMatch: ["**/tests/**/*.test.ts"],
};

export default config;
