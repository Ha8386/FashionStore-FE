// Kiểu dữ liệu phân trang chung cho BE trả về
export interface Page<T> {
  content: T[];
  number: number;        // trang hiện tại (0-based)
  size: number;          // kích thước trang
  totalElements: number; // tổng số bản ghi
  totalPages: number;    // tổng số trang
  first: boolean;
  last: boolean;
}
