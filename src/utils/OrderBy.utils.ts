export class OrderBy {
  execute(data?: string): object | null {
    if (!data) return null;
    const [field, sort] = data.split('.');
    return {
      [field]: sort,
    };
  }
}
