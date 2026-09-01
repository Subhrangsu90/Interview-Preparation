import { UiPaginatePipe, paginateSlice } from './paginate.pipe';

describe('UiPaginatePipe', () => {
  const pipe = new UiPaginatePipe();
  const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('should slice array into pages correctly', () => {
    expect(pipe.transform(sample, 0, 4)).toEqual([1, 2, 3, 4]);
    expect(pipe.transform(sample, 1, 4)).toEqual([5, 6, 7, 8]);
    expect(pipe.transform(sample, 2, 4)).toEqual([9, 10]);
  });

  it('should handle null or undefined input', () => {
    expect(pipe.transform(null, 0, 5)).toEqual([]);
    expect(pipe.transform(undefined, 0, 5)).toEqual([]);
  });

  it('should prevent out-of-bounds page indices', () => {
    expect(paginateSlice(sample, 999, 4)).toEqual([9, 10]);
  });
});
