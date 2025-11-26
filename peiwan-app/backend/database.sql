-- 陪玩小程序数据库结构

-- 分类表
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` varchar(255) DEFAULT NULL COMMENT '分类描述',
  `icon` varchar(100) DEFAULT NULL COMMENT '分类图标',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `level` int(11) DEFAULT '1' COMMENT '用户等级',
  `points` int(11) DEFAULT '0' COMMENT '积分',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品表
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `category` varchar(50) DEFAULT NULL COMMENT '分类',
  `image` varchar(255) DEFAULT NULL COMMENT '商品图片URL',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：1上架，0下架',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 订单表
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `product_id` int(11) NOT NULL COMMENT '商品ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `contact_info` varchar(255) DEFAULT NULL COMMENT '联系方式',
  `game_account` varchar(100) DEFAULT NULL COMMENT '游戏账号',
  `payment_method` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '第三方交易号',
  `status` varchar(20) DEFAULT 'pending' COMMENT '订单状态：pending待支付，paid已支付，completed已完成，cancelled已取消，refunded已退款',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT '支付时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 公告表
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `type` varchar(20) DEFAULT 'normal' COMMENT '公告类型：normal普通，important重要',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：1显示，0隐藏',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- 积分记录表
CREATE TABLE `points_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `points` int(11) NOT NULL COMMENT '积分数值（正数为获得，负数为消费）',
  `type` varchar(20) NOT NULL COMMENT '类型：order下单，refund退款，register注册，admin管理员调整',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `related_id` int(11) DEFAULT NULL COMMENT '关联ID（如订单ID）',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `points_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分记录表';

-- 管理员表
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `role` varchar(20) DEFAULT 'admin' COMMENT '角色：super超级管理员，admin管理员',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员账号（密码：admin123）
INSERT INTO `admins` (`username`, `password`, `role`) VALUES 
('admin', '$2a$10$YKUxjH7KjGKgNhMzGqHqOeLq4vHqGqHqOeLq4vHqGqHqOeLq4vHqG', 'super');

-- 插入示例分类
INSERT INTO `categories` (`name`, `description`, `icon`, `sort_order`, `status`) VALUES 
('王者荣耀', '王者荣耀相关服务', 'star', 1, 1),
('英雄联盟', '英雄联盟相关服务', 'star', 2, 1),
('和平精英', '和平精英相关服务', 'star', 3, 1),
('原神', '原神相关服务', 'star', 4, 1),
('DNF', '地下城与勇士相关服务', 'star', 5, 1),
('CF', '穿越火线相关服务', 'star', 6, 1);

-- 插入示例商品
INSERT INTO `products` (`name`, `description`, `price`, `category`, `image`, `status`) VALUES 
('王者荣耀陪玩', '专业陪玩师带你上分，段位钻石以上', 30.00, '王者荣耀', 'https://example.com/wzry.jpg', 1),
('英雄联盟陪玩', '高分段大神陪玩，快速提升技术', 25.00, '英雄联盟', 'https://example.com/lol.jpg', 1),
('和平精英陪玩', '王牌陪玩师带你吃鸡', 35.00, '和平精英', 'https://example.com/pkjj.jpg', 1),
('原神陪玩', '深境螺旋满星，材料收集', 40.00, '原神', 'https://example.com/ys.jpg', 1);

-- 插入示例公告
INSERT INTO `announcements` (`title`, `content`, `type`, `status`) VALUES 
('欢迎使用陪玩小程序', '感谢您使用我们的陪玩服务，如有问题请联系客服', 'normal', 1),
('价格调整通知', '由于市场变化，部分陪玩服务价格有所调整', 'important', 1);