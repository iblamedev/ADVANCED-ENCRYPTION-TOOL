# ADVANCED-ENCRYPTION-TOOL

*COMPANY*    :    CODTECH IT SOLUTIONS

*NAME*       :    DEV BALAJI A

*INTERN ID*  :    CITS0D23

*DOMAIN*     :    CYBER SECURITY

*DURATION*   :    4 WEEKS

*MENTOR*     :    NEELA SANTOSH


The Advanced Encryption Tool is a web-based application that enables users to securely encrypt and decrypt files using the AES-256-GCM algorithm. It serves as a practical implementation of modern cryptographic principles to protect sensitive data. The tool emphasizes strong encryption, password-based key generation, and complete client-side processing for privacy and security.

The primary goal of this tool is to transform user files into encrypted versions that can only be decrypted using the same password. AES-256 (Advanced Encryption Standard with a 256-bit key) is currently one of the most secure and widely used symmetric encryption algorithms in the world. We used AES in GCM mode, which provides both encryption and integrity verification, ensuring that the file has not been tampered with.

The user interface is clean, simple, and visually appealing. On launch, the user is presented with two main panels: one for file selection and one for entering the encryption password. Users can drag and drop files or browse to upload them. After entering a strong password, they can choose to either encrypt or decrypt the file. Encrypted files are saved with a `.enc` extension, and decrypted files restore their original names and content.

Under the hood, the tool uses the Web Crypto API, a powerful browser-native library that allows secure key generation, encryption, and decryption. Passwords are converted into cryptographic keys using PBKDF2 (Password-Based Key Derivation Function 2), which adds thousands of iterations to slow down brute-force attempts. The application never stores the password or files; everything is processed locally in the browser.

Security best practices such as random IV (Initialization Vector) generation, authenticated encryption (via GCM), and message authentication codes (MACs) are incorporated. This ensures that the encrypted files are not only confidential but also protected from manipulation.

This tool is perfect for students, developers, and privacy-conscious users who want to understand encryption and secure their files. It is also ideal for demonstrating core concepts of symmetric encryption in academic settings. By working fully client-side, it respects user privacy and requires no external server or API.

The application encourages users to use strong, memorable passwords and reminds them that lost passwords mean permanently inaccessible encrypted data. A security information section reinforces these practices, providing users with insight into how the tool protects their data.

In conclusion, the Advanced Encryption Tool blends usability, security, and education. It offers a real-world demonstration of AES-256 encryption while maintaining a friendly and intuitive experience. It's a powerful yet accessible project that emphasizes both cybersecurity awareness and practical protection.


# OUTPUT

