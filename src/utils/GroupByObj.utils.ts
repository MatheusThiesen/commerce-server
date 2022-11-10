interface GroupByObject<T> {
  value: unknown;
  data: T[];
}

export class GroupByObj {
  execute<T>(arr: Array<T>, callback: (b: T) => unknown): GroupByObject<T>[] {
    const response: GroupByObject<T>[] = [];

    for (const item of arr) {
      const key = callback(item);

      const findOne = response.find((f) => f.value === key);

      if (findOne) {
        findOne.data.push(item);
      } else {
        response.push({
          value: key,
          data: [item],
        });
      }
    }

    return response;
  }
}
