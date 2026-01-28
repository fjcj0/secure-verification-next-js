"use client";
import { tokenProvider } from "@/actions/stream.actions";
import {
    StreamVideo,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videClient, setVideoClient] = useState<StreamVideoClient>();
    const user ={
        id: "123123",
        name: "ali",
        username: "123123",
        imageUrl: "kaskfasf.com"
    }
    useEffect(() => {
        if (!user) return;
        if (!apiKey) throw new Error('Key missing!!');
        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: user?.id,
                name: user?.username || user?.id,
                image: user?.imageUrl,
            },
            tokenProvider
        });
        setVideoClient(client);
    }, [user]);
    if (!videClient) return (<h1>Loading...</h1>)
    return (
        <StreamVideo client={videClient}>
            {children}
        </StreamVideo>
    );
};