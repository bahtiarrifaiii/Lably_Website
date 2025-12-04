-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2025 at 12:00 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lably_website`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(50) NOT NULL,
  `username` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `email`, `password`) VALUES
(1, 'etmin', 'admin@gmail.com', '$2b$10$b9Ly7MLMAD66SG5Wj4my7.BIIwtp9fqbA/cby18aho3BdlDTTi4Du');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(50) NOT NULL,
  `name` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`) VALUES
(22, 'Biologi dan Ilmu Hayati'),
(23, 'Kimia dan Ilmu Material');

-- --------------------------------------------------------

--
-- Table structure for table `d_peminjaman`
--

CREATE TABLE `d_peminjaman` (
  `id` int(50) NOT NULL,
  `id_user` int(50) NOT NULL,
  `id_products` int(50) NOT NULL,
  `price` varchar(250) NOT NULL,
  `tgl_pinjam` date NOT NULL,
  `tgl_kembali` date NOT NULL,
  `status` enum('draft') NOT NULL DEFAULT 'draft',
  `qty` int(50) NOT NULL,
  `no_telp` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `id` int(50) NOT NULL,
  `id_user` int(50) NOT NULL,
  `id_products` int(50) NOT NULL,
  `price` varchar(255) NOT NULL,
  `tgl_pinjam` date NOT NULL,
  `tgl_kembali` date NOT NULL,
  `status` enum('pending','in use','completed','overdue') NOT NULL,
  `qty` int(50) NOT NULL,
  `no_telp` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `peminjaman`
--

INSERT INTO `peminjaman` (`id`, `id_user`, `id_products`, `price`, `tgl_pinjam`, `tgl_kembali`, `status`, `qty`, `no_telp`, `alamat`) VALUES
(14, 9, 12, '1050000', '2025-12-24', '2025-12-31', 'in use', 1, '998', 'jhvhj'),
(15, 9, 15, '1500000', '2025-12-12', '2025-12-13', 'completed', 1, '998', 'jhvhj'),
(17, 9, 8, '200000', '2025-12-19', '2025-12-20', 'in use', 1, '998', 'jhvhj');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `id_category` int(50) NOT NULL,
  `description` varchar(250) NOT NULL,
  `stock` int(50) NOT NULL,
  `kondisi` varchar(250) NOT NULL,
  `price` int(50) NOT NULL,
  `image` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `id_category`, `description`, `stock`, `kondisi`, `price`, `image`) VALUES
(6, 'NanoDrop Spectrophotometer', 22, 'NanoDrop adalah spektrofotometer mikro volume yang memungkinkan pengukuran konsentrasi dan kemurnian atau protein menggunakan volume sampel yang sangat kecil tanpa memerlukan kuvet. Instrumen ini bekerja dengan menahan tetesan sampel di antara dua se', 10, 'Sangat Baik', 1200000, '1764589114461-Tabung Gas.png'),
(7, 'Thermal Cycler', 22, 'Alat yang digunakan untuk melakukan Polymerase Chain Reaction, yaitu serangkaian siklus pemanasan dan pendinginan yang sangat tepat untuk mengamplifikasi (memperbanyak) sekuens spesifik.', 5, 'Sangat Baik', 300000, '1764589106994-Tabung Gas.png'),
(8, 'Centrifuge', 22, 'Mesin yang memutar sampel dengan kecepatan sangat tinggi untuk memisahkan komponen-komponen (seperti sel, pelet, atau organel) berdasarkan perbedaan massa jenis melalui gaya sentrifugal.', 8, 'Sangat Baik', 200000, '1764589099874-Tabung Gas.png'),
(9, 'Gel Electrophoresis System', 22, 'Alat yang memisahkan molekul bermuatan berdasarkan ukuran ketika sampel dialirkan listrik melalui media gel, digunakan untuk memeriksa kualitas dan ukuran produk.', 15, 'Sangat Baik', 250000, '1764589873685-Tabung Gas.png'),
(10, 'Mikropipet', 22, 'Alat presisi yang digunakan untuk mengambil dan memindahkan volume cairan yang sangat kecil (dalam skala mikroliter), merupakan alat dasar penting dalam menyiapkan semua reaksi biologi molekuler.', 20, 'Sangat Baik', 50000, '1764589086892-Tabung Gas.png'),
(11, 'Mikroskop Cahaya', 22, 'Alat fundamental untuk mengamati objek mikroskopis seperti sel, jaringan, bakteri, dan jamur, dengan memperbesar citra melalui sistem lensa dan pencahayaan.', 5, 'Sangat Baik', 100000, '1764589072619-Tabung Gas.png'),
(12, 'Inkubator', 22, 'Ruangan atau wadah yang menyediakan suhu, kelembaban, dan terkadang kadar CO2 yang terkontrol dan stabil untuk mendukung pertumbuhan optimal mikroorganisme atau kultur sel.', 7, 'Sangat Baik', 150000, '1764589060419-Tabung Gas.png'),
(13, 'Autoklaf', 22, 'Alat sterilisasi yang menggunakan uap air panas bertekanan tinggi (121 C dan 15 psi) untuk membunuh semua mikroorganisme, termasuk spora, pada alat dan media yang digunakan.', 3, 'Sangat Baik', 200000, '1764589227085-Tabung Gas.png'),
(14, 'Qubit Fluorometer', 22, 'Alat kuantifikasi yang lebih spesifik daripada NanoDrop, menggunakan pewarnaan fluoresensi yang hanya berinteraksi dengan molekul target ($\\text{DNA}$ untai ganda atau protein) sehingga menghasilkan pengukuran konsentrasi dengan sensitivitas dan spes', 2, 'Sangat Baik', 300000, '1764589264140-Tabung Gas.png'),
(15, 'HPLC', 23, 'Alat kromatografi canggih yang digunakan untuk memisahkan, mengidentifikasi, dan mengkuantifikasi setiap komponen dalam campuran cair kompleks. Prinsipnya adalah memisahkan analit berdasarkan interaksi yang berbeda dengan fase diam dan fase gerak.', 5, 'Sangat Baik', 1500000, '1764589337607-Tabung Gas.png'),
(16, 'FTIR', 23, 'Teknik spektroskopi yang digunakan untuk mengidentifikasi gugus fungsi kimia dan ikatan kovalen dalam suatu sampel (padat, cair, atau gas). Alat ini bekerja dengan merekam spektrum serapan dan transmisi inframerah, menghasilkan \"sidik jari\" molekul.', 6, 'Sangat Baik', 500000, '1764589378244-Tabung Gas.png');

-- --------------------------------------------------------

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `id` int(50) NOT NULL,
  `sent_at` datetime NOT NULL,
  `id_peminjaman` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `status`, `created_at`, `last_login`) VALUES
(8, 'Bima', 'bima@gmail.com', '$2b$10$FmCL.PkghfWzndZ5.QUwI.Kvopfbo8V9XEDPvPSiOQWqucrz6KKy6', 'inactive', '2025-11-20 15:52:39', '2025-11-20 23:02:33'),
(9, 'Fikri', 'fikri@gmail.com', '$2b$10$UebE8MYFCGC9QApehlZaCeS2TOq5sLMZO6kdw9eKbj8xMtzS4xw8y', 'inactive', '2025-11-20 16:01:38', '2025-12-05 04:26:09'),
(10, 'Hanni', 'hanni@gmail.com', '$2b$10$ISb9CGqUchgBigd50UkngOGzRxVN/B27lfOezVcnGA9GP05csbwfu', 'inactive', '2025-12-01 12:24:04', '2025-12-01 19:45:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_products` (`id_products`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_products` (`id_products`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_category` (`id_category`);

--
-- Indexes for table `reminder`
--
ALTER TABLE `reminder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_peminjaman` (`id_peminjaman`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `reminder`
--
ALTER TABLE `reminder`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  ADD CONSTRAINT `d_peminjaman_ibfk_1` FOREIGN KEY (`id_products`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `d_peminjaman_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `peminjaman_ibfk_2` FOREIGN KEY (`id_products`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `peminjaman_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `category` (`id`);

--
-- Constraints for table `reminder`
--
ALTER TABLE `reminder`
  ADD CONSTRAINT `reminder_ibfk_1` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
