import { prismaClient } from "../db.config";
import type {authRequest}  from "../middlewares/auth"
import type { Response } from "express"
import _ from 'lodash'
import { validate as isUUID } from "uuid";

export const get_Messages = async (req: authRequest, res: Response) => {
    try {
        const chat_id = req.query.chat_id as string;
        const page = parseInt(req.query.page as string) || 0;
        if (!chat_id || !isUUID(chat_id) || isNaN(page)) {
            throw new Error("Invalid chat_id or page number");
        }

        const chat = await prismaClient.chat_rooms.findFirst({
            where: {
                id: chat_id,
            },
        });

        if (!chat) {
            return res.status(404).json({ error: "Chat room not found" });
        }

        const pageSize = 20;
        const messages = await prismaClient.messages.findMany({
            where: { chat_room_id: chat.id },
            orderBy: { created_at: "desc" },
            skip: 0,
            take: pageSize*(page+1),
        });

        const nextPage = messages.length === pageSize ? page + 1 : null;
        const messages_ = _.orderBy(messages , (m)=>m.created_at , 'desc')
        return res.json({ messages:messages_, nextCursor: nextPage , blocked:chat.blocked });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
};