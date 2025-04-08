import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465,
            auth: {
                user: config.email.auth.user,
                pass: config.email.auth.pass
            }
        });
    }

    async sendEmail(to, subject, template, context) {
        try {
            // Read the template file
            const templatePath = path.join(__dirname, '../views/emails', `${template}.hbs`);
            const templateContent = await fs.readFile(templatePath, 'utf-8');
            
            // Compile the template
            const compiledTemplate = handlebars.compile(templateContent);
            const html = compiledTemplate(context);

            // Send email
            await this.transporter.sendMail({
                from: config.email.from,
                to,
                subject,
                html
            });

            if (process.env.NODE_ENV === 'development') {
                console.log(`Email sent to ${to}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(user) {
        await this.sendEmail(
            user.email,
            'Welcome to School ERP',
            'welcome',
            {
                name: user.name || user.email,
                loginUrl: `${config.clientUrl}/login`
            }
        );
    }

    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
        
        await this.sendEmail(
            user.email,
            'Password Reset Request',
            'resetPassword',
            {
                name: user.name || user.email,
                resetUrl,
                validityDuration: '10 minutes'
            }
        );
    }
}

export const emailService = new EmailService(); 