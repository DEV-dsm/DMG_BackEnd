import { registerAs } from "@nestjs/config";
import { SlackOptions } from "nestjs-slack-webhook";

export default registerAs(
    'slack',
    (): SlackOptions => ({
        url: process.env.SLACK,
    }),
);