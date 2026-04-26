import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return {
      message: "Hello from the NestJS API"
    };
  }

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
