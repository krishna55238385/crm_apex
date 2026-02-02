import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("[EmailService] No SMTP credentials found. Mocking sending email to:", to);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"ApexAI CRM" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("[EmailService] Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("[EmailService] Error sending email:", error);
        throw error;
    }
};
