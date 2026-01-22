export default function randomArrayElements<T>(arr: T[], num: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}