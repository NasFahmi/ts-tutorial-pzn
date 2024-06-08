export class ResponseError extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        // Menyimpan status dan message ke instance
        this.status = status;
        this.message = message;
    }
}