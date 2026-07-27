# UmbraCred — Confidential Credential Verification trên Midnight

> Tên "UmbraCred" chỉ là gợi ý (umbra = vùng bóng tối hoàn toàn của nguyệt thực — đối lập với phần ánh sáng bạn *chọn* tiết lộ). Đổi tên tuỳ ý.

## Khác biệt với stellarvault (dự án tham khảo)
`stellarvault` là escrow trả lương freelance theo milestone trên **Cardano/Aiken/Plutus** (Lock → Release → Refund → Resolve, có arbiter). Dự án này:
- Chạy trên **Midnight** (Compact, ZK circuits), không phải Cardano mainnet/Plutus.
- Không có khái niệm khóa tiền / giải ngân / trọng tài tranh chấp.
- Bài toán hoàn toàn khác: **chứng minh một bằng cấp/chứng chỉ hợp lệ mà không tiết lộ nội dung chi tiết**, không phải thanh toán có điều kiện.

---

## 1. Ý tưởng cốt lõi

Một nền tảng để **issuer** (trường học, tổ chức chứng chỉ, nhà tuyển dụng nội bộ...) phát hành credential cho **holder** dưới dạng cam kết mật mã (commitment) trên ledger công khai. Sau đó, holder có thể chứng minh cho bất kỳ **verifier** nào rằng họ sở hữu một credential hợp lệ, chưa hết hạn, đạt ngưỡng yêu cầu (vd: "chứng chỉ level ≥ 3", "đã tốt nghiệp ngành X") — **mà không tiết lộ điểm số thật, tên tổ chức cấp, ngày cấp, hay bất kỳ chi tiết nào khác** ngoài đúng sự thật cần chứng minh.

Ứng dụng thực tế: nền tảng tuyển dụng/freelance nơi ứng viên chứng minh "tôi có chứng chỉ đạt yêu cầu" mà không lộ hồ sơ gốc; hoặc gate truy cập một khoá học nâng cao chỉ cho ai đã có chứng chỉ nền tảng.

### Ledger state công khai (public)
- `issuerRegistry`: danh sách issuer được duyệt (public key/id của issuer)
- `credentialCommitments`: tập hợp/Merkle tree các commitment `hash(credentialType, score, expiry, salt)` mà issuer đã ghi lên ledger
- `revokedNullifiers`: tập nullifier của các credential đã bị thu hồi
- (tuỳ chọn) bộ đếm số lượt verify đã thực hiện

### Private witness (chỉ holder biết)
- `credentialType`, `score`/`level`, `issuedAt`, `expiryDate`
- `salt` dùng để tạo commitment
- `ownerSecretKey`
- chữ ký/approval của issuer tại thời điểm cấp

### Các circuit chính
1. `issueCredential` — issuer ghi commitment lên ledger (không lộ nội dung, chỉ lộ commitment hash).
2. `proveEligibility(threshold)` — holder chứng minh: (a) sở hữu một commitment hợp lệ trong `credentialCommitments`, (b) chưa nằm trong `revokedNullifiers`, (c) `score ≥ threshold` và chưa hết hạn. Circuit **disclose() duy nhất giá trị boolean `eligible`** (và nullifier để chống replay), không disclose `score`/`credentialType`/`issuer` thật.
3. `revokeCredential` — issuer thêm nullifier vào danh sách thu hồi.

Đây chính là câu chuyện "public state vs private witness" và "disclose() có chủ đích" mà Level 1 yêu cầu giải thích trong README.

---

## 2. 🌑 Level 1 — New Moon: Checklist chi tiết

**Mục tiêu:** toolchain chạy được, contract Compact đầu tiên compile + deploy Preview/Preprod, có ý tưởng ban đầu.

- [ ] Cài Node 22, Docker, Compact compiler, proof server — verify bằng `compact --version`, `docker ps`.
- [ ] Viết contract Compact tối giản trước (đừng làm full 3 circuit ngay): bắt đầu với `issueCredential` + `proveEligibility` cơ bản (chỉ so sánh `score ≥ threshold`, chưa cần revocation).
- [ ] `compact compile` chạy sạch, thư mục `managed/` sinh ra đủ circuits + keys.
- [ ] Viết test suite tối thiểu (xem mục Testing bên dưới), pass hết.
- [ ] Deploy lên Preview hoặc Preprod, lấy contract address.
- [ ] README có đoạn ý tưởng ban đầu (1 đoạn ngắn — dùng nguyên phần "Ý tưởng cốt lõi" ở trên, viết lại bằng giọng của bạn).
- [ ] Tối thiểu 5 commit có ý nghĩa (không phải "init", "wip", "fix" chung chung).

### Submission checklist Level 1
- [ ] Repo public + `README.md`
- [ ] Hướng dẫn setup chạy local (Node version, Docker command, `compact compile`, deploy script)
- [ ] Screenshot: output `compact compile` liệt kê circuits
- [ ] Screenshot: contract đã deploy, có địa chỉ hiển thị rõ
- [ ] README mục "Public State vs Private Witness" (dùng bảng ở mục 1 làm khung)
- [ ] Đoạn ý tưởng sản phẩm ban đầu
- [ ] ≥ 5 commit ý nghĩa

### Gợi ý cadence commit (5+)
1. `chore: scaffold Compact project + toolchain setup`
2. `feat: define ledger state (issuer registry, credential commitments)`
3. `feat: implement issueCredential circuit`
4. `feat: implement proveEligibility circuit with disclose()`
5. `test: add circuit tests for eligibility proof`
6. `docs: add README with public/private state explanation + product idea`
7. `chore: deploy to Preprod, record contract address`

---

## 3. 🌒 Level 2 — Waxing Crescent: Checklist chi tiết

**Mục tiêu:** contract nối với frontend thật, Lace connect trên Preprod.

- [ ] Setup Midnight.js SDK + DApp connector trong frontend (React/Vite gợi ý, khác stack Vite+React của stellarvault về mặt chain nhưng không sao vì đây là Midnight).
- [ ] Implement connect/disconnect Lace wallet.
- [ ] UI cho holder: nhập threshold cần chứng minh → gọi `proveEligibility` → hiển thị kết quả.
- [ ] UI cho issuer (đơn giản, có thể là 1 trang admin): gọi `issueCredential`.
- [ ] Quản lý private state cục bộ (lưu credential holder ở local storage/IndexedDB đã mã hoá, không phải trên chain).
- [ ] **Observable privacy behavior** (bắt buộc) — cách demo rõ ràng nhất: làm 2 view song song —
  - View "Verifier thấy": chỉ hiện `✅ Eligible` / `❌ Not eligible` + nullifier.
  - View "Holder thấy" (dev-only toggle, ghi rõ là debug): hiện credential thật (score, issuer...).
  - Điều này cho thấy trực quan "verifier chứng minh được X mà không thấy Y" — rất dễ quay video demo.
- [ ] Deploy contract lên Preprod (verify được on-chain).
- [ ] ≥ 8 commit ý nghĩa.

### Submission checklist Level 2
- [ ] Repo + README
- [ ] Live demo link (Vercel/Netlify)
- [ ] Địa chỉ contract Preprod verify được
- [ ] Video demo: connect Lace + gọi circuit thành công
- [ ] README mục ghi rõ privacy claim ("verifier biết X nhưng không biết Y, Z")
- [ ] ≥ 8 commit ý nghĩa

---

## 4. 🌓 Level 3 — First Quarter: Checklist chi tiết

**Ý tưởng đã chọn từ danh sách bắt buộc:** **Confidential Credentials** — "prove a credential is valid without disclosing it". Ý tưởng ở mục 1 khớp thẳng với mục này, không cần đổi hướng.

- [ ] Mở rộng: hỗ trợ nhiều issuer, revocation list hoạt động thật (`revokeCredential`), kiểm tra hết hạn.
- [ ] Viết ≥ 3 test có ý nghĩa, ví dụ:
  1. Credential hợp lệ, đạt threshold → proof pass.
  2. Credential đã bị revoke → proof fail.
  3. Credential hết hạn hoặc dưới threshold → proof fail.
  4. (thêm nếu muốn) issuer không nằm trong registry → reject.
- [ ] CI/CD: GitHub Actions chạy `compact compile` + test suite trên mỗi push, badge trong README.
- [ ] Nộp product proposal chọn "Confidential Credentials" để được duyệt (theo quy trình chương trình).
- [ ] README mục "Privacy Model": liệt kê rõ **quan sát viên (observer) biết được gì / không biết được gì**:
  - Biết: có một proof hợp lệ đã được submit, kết quả boolean, issuer nằm trong registry đã duyệt, nullifier (để biết credential này đã dùng, tránh double-verify).
  - Không biết: điểm số/level thật, loại chứng chỉ cụ thể, ngày cấp, danh tính issuer cụ thể (nếu thiết kế ẩn cả issuer), liên kết giữa các lần verify khác nhau của cùng một holder (nếu dùng nullifier ngẫu nhiên hoá theo phiên).
- [ ] ≥ 10 commit ý nghĩa.

### Submission checklist Level 3
- [ ] Repo + README đầy đủ
- [ ] Live demo link
- [ ] Screenshot output test (≥3 test pass)
- [ ] CI/CD badge hoặc workflow file có run pass
- [ ] Video demo 1 phút: toàn bộ luồng issue → hold → verify → (thử revoke để show fail case)
- [ ] README mục "Privacy Model" như trên
- [ ] Product proposal nộp đúng ý tưởng "Confidential Credentials"
- [ ] ≥ 10 commit ý nghĩa

---

## 5. Rủi ro cần lưu ý
- Đừng để circuit `proveEligibility` vô tình `disclose()` cả object credential thay vì chỉ giá trị boolean — đây là lỗi phổ biến nhất làm mất hết giá trị privacy, và cũng là điểm giám khảo sẽ soi kỹ nhất ở mục "Privacy Model".
- Nullifier cần thiết kế để **không** liên kết được các lần verify khác nhau của cùng một holder lại với nhau (nếu không, "ẩn danh" chỉ là ảo — có thể theo dõi hành vi theo thời gian).
- Giữ tên issuer là public by design (registry công khai) — đừng nhầm với việc phải ẩn issuer; chỉ ẩn *danh tính người có credential* và *nội dung chi tiết*, không phải toàn bộ hệ thống.
