// bootstrap/bootstrap.ts
import { bootstrapHttp } from './http.bootstrap';

export async function bootstrap() {
  await bootstrapHttp();
}
