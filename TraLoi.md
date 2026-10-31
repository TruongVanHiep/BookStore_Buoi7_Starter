# BÁO CÁO TRẢ LỜI CÂU HỎI BỔ SUNG — BUỔI 7

### Câu 1: Cấu trúc điều hướng
**Vì sao `BookDetail` được đăng ký ở Stack mà không đặt trong Tab? Nếu đặt vào Tab thì màn hình sẽ khác đi thế nào?**
- `BookDetail` được đăng ký trong Native Stack ở ngoài cùng (`RootNavigator`) để khi người dùng mở chi tiết sách, màn hình này sẽ phủ lên toàn bộ giao diện (bao gồm cả thanh Bottom Tab) và tự động có nút mũi tên quay lại (`←`) trên thanh tiêu đề.
- Nếu đặt `BookDetail` vào bên trong TabNavigator, nó sẽ trở thành một tab riêng biệt hoặc hiển thị bên trong một tab: thanh Bottom Tab Bar vẫn luôn hiển thị phía dưới chiếm diện tích, đồng thời sẽ không có nút quay lại tự động của Stack, làm giảm trải nghiệm người dùng và sai nguyên lý phân cấp giao diện di động.

---

### Câu 2: Redux Toolkit & useMemo
**Trong reducer viết `state.items.push(...)` mà sao state gốc không bị sửa trực tiếp? Thử bỏ `useMemo` trong `useCart`: kết quả hiển thị có đổi không, và có hậu quả gì?**
- Redux Toolkit tích hợp sẵn thư viện **Immer**. Khi thao tác trong reducer, `state` truyền vào thực chất là một bản nháp ảo (Draft Proxy); Immer sẽ theo dõi mọi thay đổi rồi tự động tạo ra một bản copy state hoàn toàn mới (bất biến - immutable) ở phía sau mà không sửa trực tiếp vào state gốc.
- Nếu bỏ `useMemo` khi tính `totalQuantity` và `totalPrice` trong `useCart`, kết quả hiển thị trên giao diện **không thay đổi**. Tuy nhiên, hậu quả là hàm `reduce` sẽ phải chạy lại ở **mọi lần component re-render** (kể cả khi giỏ hàng không thay đổi mà component render lại vì lý do khác). Với danh sách giỏ hàng nhiều món hàng, điều này gây lãng phí CPU và ảnh hưởng đến hiệu năng render.

---

### Câu 3: Promise.all & Xử lý lỗi API
**Nếu `getCategories()` lỗi còn `getBooks()` thành công thì Home hiện gì? Tìm cách để vẫn hiện được danh sách sách (gợi ý: `Promise.allSettled`) và nói rõ cách đó phải đánh đổi gì.**
- Vì dùng `Promise.all`, theo cơ chế "fail-fast", nếu chỉ một trong hai API bị lỗi (ở đây là `getCategories()`), toàn bộ `Promise.all` sẽ nhảy ngay vào nhánh `catch` và màn Home sẽ hiển thị `ErrorView` (thông báo lỗi mạng kèm nút Thử lại), người dùng sẽ không thấy được sách nào dù `getBooks()` đã thành công.
- Để vẫn hiển thị danh sách sách, ta có thể dùng `Promise.allSettled([getBooks(), getCategories()])`:
  ```ts
  const [bRes, cRes] = await Promise.allSettled([getBooks(), getCategories()]);
  if (bRes.status === "fulfilled") setBooks(bRes.value);
  if (cRes.status === "fulfilled") setCategories(cRes.value);
  ```
- **Sự đánh đổi:** Giao diện có thể bị khuyết một phần (ví dụ: có danh sách sách nhưng hàng chip danh mục bị rỗng hoặc không lọc được), đồng thời lập trình viên phải viết thêm logic xử lý trạng thái lỗi riêng lẻ cho từng phần thay vì xử lý tập trung một lỗi chung cho toàn màn hình.

---

### Câu 4: Debounce trong ô tìm kiếm
**Vì sao không đặt `setTimeout` thẳng trong `onChangeText`? Hàm dọn dẹp (`return () => clearTimeout`) giúp tránh lỗi gì?**
- Nếu đặt `setTimeout` thẳng trong `onChangeText`, mỗi lần người dùng gõ một ký tự sẽ tạo ra một timer độc lập mà không bị hủy khi gõ ký tự tiếp theo; kết quả là sau khoảng thời gian delay, toàn bộ các hàm callback đó vẫn lần lượt được kích hoạt, khiến việc lọc bị chạy nhiều lần liên tục (chỉ là bị trễ đi chứ không giảm bớt số lần tính toán).
- Hàm dọn dẹp `return () => clearTimeout(timer)` giúp hủy bỏ timer cũ trước khi kích hoạt timer mới mỗi khi từ khóa thay đổi, đảm bảo chỉ có lần gõ phím cuối cùng mới thực thi; đồng thời tránh lỗi rò rỉ bộ nhớ (memory leak) và cảnh báo *"Can't perform a React state update on an unmounted component"* nếu component bị unmount trước khi timer hoàn thành.

---

### Câu 5: Code bổ sung — Tuỳ chọn sắp xếp “Giá tăng dần / giảm dần”
**Đoạn code bổ sung cho HomeScreen:**
1. Thêm state lưu hướng sắp xếp:
```tsx
const [sortByPrice, setSortByPrice] = useState<"asc" | "desc" | null>(null);
```

2. Cập nhật `visibleBooks` trong `useMemo`:
```tsx
const visibleBooks = useMemo(() => {
  const filtered = filterBooks(books, { keyword: debouncedKeyword, categoryId, priceRange });
  if (!sortByPrice) return filtered;
  return [...filtered].sort((a, b) =>
    sortByPrice === "asc" ? a.price - b.price : b.price - a.price
  );
}, [books, debouncedKeyword, categoryId, priceRange, sortByPrice]);
```

3. Thêm giao diện nút bấm chuyển đổi sắp xếp cạnh bộ lọc:
```tsx
<Pressable
  style={[styles.sortBtn, sortByPrice !== null && styles.sortBtnActive]}
  onPress={() => setSortByPrice((v) => (v === null ? "asc" : v === "asc" ? "desc" : null))}
>
  <Text style={styles.sortBtnText}>
    {sortByPrice === "asc" ? "Giá: Thấp → Cao ⬆️" : sortByPrice === "desc" ? "Giá: Cao → Thấp ⬇️" : "Sắp xếp giá ↕️"}
  </Text>
</Pressable>
```
