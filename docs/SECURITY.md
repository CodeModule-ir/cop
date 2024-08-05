# Security Policy

## Introduction

As maintainers of the [CodeModule](https://t.me/CodeModule) Bot Project, we prioritize the security of our application and the data it handles. This document outlines how we manage security issues and handle sensitive information.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us in a responsible manner. Here are the steps to follow:

1. **Do Not Post Publicly:** Do not disclose the vulnerability in public forums or platforms. This could lead to exploitation before a fix is available.
2. **Email the Team:** Send an email to our security team at [bitsgenix@gmail.com](mailto:bitsgenix@gmail.com) with detailed information about the vulnerability, including steps to reproduce and potential impacts.
3. **Confidentiality:** We will keep your report confidential and will work with you to address the issue.

## Security Characteristics

### Data Access and Storage

- **Group Information:** The bot collects and stores data related to group settings, such as group name, welcome message, rules, and a blacklist. This data is stored securely in a MySQL database.
- **User Information:** User data such as Telegram ID and role are stored in the database. This data is used for managing group memberships, warnings, and approvals.
- **Warnings and Bans:** The bot maintains a record of user warnings and bans. If a user reaches a threshold of warnings, they are banned from the group.

## Security Updates

- **Regular Updates:** We regularly update the application to address security vulnerabilities and improve overall security. Ensure that you are using the latest version of the bot to benefit from these updates.
- **Patch Management:** If a security vulnerability is identified, we will release patches as soon as possible. Stay informed about updates and apply patches promptly.