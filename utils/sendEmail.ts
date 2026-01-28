import nodemailer from 'nodemailer';
export const sendEmail = async ({
    from,
    to,
    subject,
    html,
}: {
    from: string;
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "yahoo",
            auth: {
                user: process.env.EMAIL_DOMAIN!,
                pass: process.env.PASSWORD_APP!,
            },
        });
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
    } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
};