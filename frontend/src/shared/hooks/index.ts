import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@store';

type TypedDispatch = typeof dispatch;
type TypedSelector = typeof selector;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected = unknown>(selector: (state: RootState) => TSelected): TSelected => {
  return useSelector(selector) as TSelected;
};