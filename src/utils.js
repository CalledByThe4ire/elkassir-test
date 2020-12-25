export const map = (items) => {
  const mapByIndex = (collection, index) => collection.map((item) => {
    if (index < 0) {
      throw new Error("Number mustn't be negative");
    } else if (index > collection.length - 1) {
      throw new Error(`Number must be less than ${collection.length - 1}`);
    }

    return item[index];
  });

  let counter = 0;

  const acc = [];

  while (counter < items.length - 1) {
    acc.push(mapByIndex(items, counter));
    counter += 1;
  }

  return acc;
};

export const getDiff = (oldItems, newItems) => {
  const diffItems = oldItems
    .map((item) => item.id)
    .filter((x) => !newItems.map((item) => item.id).includes(x));

  return newItems.filter((item) => diffItems.includes(item.id));
};
