
export const everyDistinctPairInArray = <T>(array: T[]): [T, T][] => (
    array.map((element1, index) => array.slice(index + 1).map(element2 => [element1, element2] as [T, T])).reduce(
        (pairs, innerPairs) => pairs.concat(innerPairs), []
    )
);
