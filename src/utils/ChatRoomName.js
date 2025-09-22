export function chatRoomName(userA, userB) {
  const a = Number(userA), b = Number(userB);
  const small = Math.min(a,b), big = Math.max(a,b);
  return `chat_${small}_${big}`;
}
