import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {createDesignApprovalService} from '../server/design-approvals.mjs';
export async function handleApproval(request:Request){
 const user=await getChatGPTUser();
 return createDesignApprovalService({db:env.DB,bucket:env.BUCKET}).handle(request,user);
}
