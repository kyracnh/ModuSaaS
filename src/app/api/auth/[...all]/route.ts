import { getAuth } from "@/modules/auth/auth";
export const GET = (req: Request) => getAuth().handler(req);
export const POST = (req: Request) => getAuth().handler(req);
