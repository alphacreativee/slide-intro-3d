// Đăng ký plugin ScrollTrigger của GSAP để sử dụng các tính năng animation khi scroll
gsap.registerPlugin(ScrollTrigger);

// Khởi tạo thư viện Lenis để tạo smooth scroll (cuộn mượt mà)
const lenis = new Lenis();

// Lắng nghe sự kiện scroll từ Lenis và cập nhật ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);

// Thêm Lenis vào ticker của GSAP để đồng bộ frame với animation
// Nhân với 1000 để chuyển từ seconds sang milliseconds
gsap.ticker.add((time) => lenis.raf(time * 1000));

// Tắt tính năng lag smoothing của GSAP (tối ưu performance)
gsap.ticker.lagSmoothing(0);

// Hàm xử lý animation khi scroll
function handleScroll() {
  // Tìm element có class "relative-block" (container chính)
  const relativeBlock = document.querySelector(".relative-block");

  // Tìm tất cả các slide có class "slider-slide is--review"
  const reviewSlides = document.querySelectorAll(".slider-slide.is--review");

  // Nếu không tìm thấy relative-block thì thoát khỏi function
  if (!relativeBlock) return;

  // Lấy vị trí và kích thước của relative-block so với viewport
  const rect = relativeBlock.getBoundingClientRect();

  // Lấy chiều cao của cửa sổ trình duyệt
  const windowHeight = window.innerHeight;

  // Kiểm tra xem relative-block có nằm trong viewport không
  // rect.top < windowHeight: phần trên của element đã vào viewport
  // rect.bottom > 0: phần dưới của element vẫn còn trong viewport
  if (rect.top < windowHeight && rect.bottom > 0) {
    // Offset để tạo delay cho animation (5% của quá trình scroll)
    const animationOffset = 0.1;

    // Tính toán progress của scroll (từ 0 đến 1)
    // Công thức: (windowHeight - rect.top) / (windowHeight + rect.height) - animationOffset
    const scrollProgress = Math.max(
      0, // Giá trị tối thiểu là 0
      Math.min(
        1, // Giá trị tối đa là 1
        (windowHeight - rect.top) / (windowHeight + rect.height) -
          animationOffset
      )
    );

    // Duyệt qua từng slide để áp dụng animation
    reviewSlides.forEach((slide, index) => {
      // Giá trị tối thiểu cho điểm kết thúc animation
      const minEnd = 0.35;

      // Tính toán điểm kết thúc cho từng slide
      // Slide cuối cùng sẽ kết thúc sớm nhất (tại minEnd = 0.35)
      // Slide đầu tiên sẽ kết thúc muộn nhất (tại 1.0)
      const end =
        minEnd +
        ((reviewSlides.length - 1 - index) / (reviewSlides.length - 1)) *
          (1 - minEnd);

      // Giới hạn progress cho slide hiện tại
      const clampedProgress = Math.min(scrollProgress / end, 1);

      // Vị trí Z ban đầu (slide sau sẽ ở xa hơn)
      const initialZ = -40 * (reviewSlides.length - index);

      // Tính toán vị trí Z mới dựa trên progress
      // Từ initialZ -> 60 (tiến lên phía trước)
      const translateZ = initialZ + (60 - initialZ) * clampedProgress;

      // Mặc định không có dịch chuyển theo trục X
      let translateX = 0;

      // Nếu slide có class "is--left" thì dịch chuyển sang trái
      if (slide.classList.contains("is--left")) {
        translateX = -9 * clampedProgress; // Dịch chuyển 9vw sang trái
      }
      // Nếu slide có class "is--right" thì dịch chuyển sang phải
      else if (slide.classList.contains("is--right")) {
        translateX = 9 * clampedProgress; // Dịch chuyển 9vw sang phải
      }

      // Sử dụng GSAP.set() để áp dụng transform mượt mà hơn
      gsap.set(slide, {
        x: `${translateX}vw`,
        z: `${translateZ}vw`,
        force3D: true, // Tối ưu performance với GPU
      });
    });
  }
}

// Hàm khởi tạo cho màn hình lớn (≥768px)
function initializesliderForLargeScreens() {
  // Tìm tất cả các slide review
  const reviewSlides = document.querySelectorAll(".slider-slide.is--review");

  // Tìm container chính
  const relativeBlock = document.querySelector(".relative-block");

  // Nếu có relative-block thì set chiều cao và perspective
  if (relativeBlock) {
    // Chiều cao = số lượng slide × 40vw
    const totalHeight = reviewSlides.length * 40;
    relativeBlock.style.height = `${totalHeight}vw`;

    // Thêm perspective để tạo hiệu ứng 3D
    gsap.set(relativeBlock, {
      perspective: 1000,
    });
  }

  // Thêm class để phân biệt slide trái/phải và khởi tạo vị trí ban đầu
  reviewSlides.forEach((slide, index) => {
    if (index % 2 === 0) {
      // Slide có index chẵn (0, 2, 4...) -> bên phải
      slide.classList.add("is--right");
    } else {
      // Slide có index lẻ (1, 3, 5...) -> bên trái
      slide.classList.add("is--left");
    }

    // Khởi tạo vị trí ban đầu với GSAP
    const initialZ = -40 * (reviewSlides.length - index);
    gsap.set(slide, {
      z: `${initialZ}vw`,
      force3D: true,
    });
  });

  // Thêm event listener để xử lý scroll
  window.addEventListener("scroll", handleScroll);

  // Chạy handleScroll một lần để khởi tạo
  handleScroll();
}

// Hàm dọn dẹp khi chuyển sang màn hình nhỏ
function cleanupslider() {
  const reviewSlides = document.querySelectorAll(".slider-slide.is--review");
  const relativeBlock = document.querySelector(".relative-block");

  // Reset tất cả transform về mặc định
  reviewSlides.forEach((slide) => {
    gsap.set(slide, {
      clearProps: "all",
    });
    slide.classList.remove("is--left", "is--right");
  });

  // Reset container
  if (relativeBlock) {
    gsap.set(relativeBlock, {
      clearProps: "all",
    });
    relativeBlock.style.height = "auto";
  }

  // Xóa event listener
  window.removeEventListener("scroll", handleScroll);
}

// Kiểm tra kích thước màn hình khi tải trang
// Nếu width ≥ 768px thì khởi tạo animation
if (window.innerWidth >= 768) {
  initializesliderForLargeScreens();
}

// Lắng nghe sự kiện resize của window
window.addEventListener("resize", function () {
  if (window.innerWidth >= 768) {
    // Nếu resize về màn hình lớn -> khởi tạo animation
    initializesliderForLargeScreens();
  } else {
    // Nếu resize về màn hình nhỏ -> dọn dẹp
    cleanupslider();
  }
});
