export default interface ReplyType {
  replyno: number;
  contentsno: number;
  memberno: number;
  id?: string;
  name?: string;
  content: string;
  passwd?: string;
  rdate: string;
}