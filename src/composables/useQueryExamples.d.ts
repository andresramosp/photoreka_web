import { Ref, ComputedRef } from "vue";

export interface QueryExample {
  [key: string]: any;
}

export interface UseQueryExamplesReturn {
  exampleIndex: Ref<number>;
  isSliding: Ref<boolean>;
  currentExamples: ComputedRef<QueryExample[]>;
  currentExampleText: ComputedRef<string>;
  handleExampleClick: () => void;
  startCarousel: () => void;
  stopCarousel: () => void;
  resetIndex: () => void;
}

export declare function useQueryExamples(
  searchType: Ref<string>,
  searchMode?: Ref<string>,
  onExampleClick?: (
    example: QueryExample,
    exampleText: string,
    searchType: string
  ) => void
): UseQueryExamplesReturn;
