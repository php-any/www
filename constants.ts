
import { Project } from './types';

export const HOME_FEATURES = {
  en: [
    {
      id: 'concurrency',
      title: 'Go-Powered Concurrency',
      description: 'Spawn lightweight actors that communicate via message passing. Go\'s goroutines meet PHP\'s simple syntax.',
      code: `use std/actor;

actor Worker {
    public function receive(string $msg) {
        echo "Worker received: " . $msg;
    }
}

function main() {
    // Spawns a goroutine under the hood
    $w = spawn new Worker();
    $w->send("Process data");
    echo "Message sent non-blocking";
}`
    },
    {
      id: 'types',
      title: 'Refined Types',
      description: 'Strong typing with runtime flexibility. Express complex constraints that are validated at compile time.',
      code: `struct User {
    public int $id;
    public string $email; // | email_format
    public int $age;      // | 0..120
}

function register(User $u) {
    // No runtime validation needed
    db::save($u);
}

function main() {
    // Compiler error if format doesn't match
    $u = new User(
        id: 1, 
        email: "invalid", // Error!
        age: 200 // Error!
    );
}`
    },
    {
      id: 'interop',
      title: 'Seamless Go Interop',
      description: 'Call Go functions and use Go structs directly. No FFI, no glue code, just seamless integration.',
      code: `// Go standard library import
use go/time;
use go/fmt;

function main() {
    // Call Go function directly
    $now = time::Now();
    fmt::Println("Current time from Go:", $now);
    
    // Use Go struct methods
    $duration = time::ParseDuration("1h30m");
    echo "Duration seconds: " . $duration->Seconds();
}`
    }
  ],
  zh: [
    {
      id: 'concurrency',
      title: 'Go 驱动的并发',
      description: '生成通过消息传递进行通信的轻量级 Actor。Go 的 Goroutine 遇上 PHP 的简洁语法。',
      code: `use std/actor;

actor Worker {
    public function receive(string $msg) {
        echo "Worker received: " . $msg;
    }
}

function main() {
    // 底层生成一个 goroutine
    $w = spawn new Worker();
    $w->send("Process data");
    echo "Message sent non-blocking";
}`
    },
    {
      id: 'types',
      title: '精炼类型系统',
      description: '强类型与运行时灵活性的结合。直接在类型系统中表达复杂的约束，并在编译时进行验证。',
      code: `struct User {
    public int $id;
    public string $email; // | email_format
    public int $age;      // | 0..120
}

function register(User $u) {
    // 无需运行时验证
    db::save($u);
}

function main() {
    // 如果格式不匹配则编译报错
    $u = new User(
        id: 1, 
        email: "invalid", // Error!
        age: 200 // Error!
    );
}`
    },
    {
      id: 'interop',
      title: '无缝 Go 互操作',
      description: '直接调用 Go 函数和使用 Go 结构体。没有 FFI，没有胶水代码，只有无缝集成。',
      code: `// 导入 Go 标准库
use go/time;
use go/fmt;

function main() {
    // 直接调用 Go 函数
    $now = time::Now();
    fmt::Println("Current time from Go:", $now);
    
    // 使用 Go 结构体方法
    $duration = time::ParseDuration("1h30m");
    echo "Duration seconds: " . $duration->Seconds();
}`
    }
  ]
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'webview-gui',
    name: 'Cross-Platform GUI',
    description: 'Build desktop apps with HTML/CSS UI and Go backend performance.',
    files: {
      'src/main.zy': {
        name: 'main.zy',
        language: 'origami',
        isEntry: true,
        content: `use std/webview;
use std/os;

function main() {
    $app = webview::create(debug: true);
    $app->setTitle("Origami Studio");
    $app->setSize(800, 600);
    
    // Bind Go/Origami function to JS
    $app->bind("saveFile", function($content) {
        os::writeFile("data.txt", $content);
        return "Saved " . strlen($content) . " bytes";
    });

    $app->navigate("file://" . os::getcwd() . "/assets/index.html");
    $app->run();
}`
      },
      'assets/index.html': {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<body>
    <h1>Origami GUI</h1>
    <textarea id="editor" rows="10"></textarea>
    <button onclick="save()">Save to Disk</button>
    <script>
        async function save() {
            const content = document.getElementById('editor').value;
            // Call Origami function
            const result = await window.saveFile(content);
            alert(result);
        }
    </script>
</body>
</html>`
      }
    }
  },
  {
    id: 'im-system',
    name: 'High-Perf IM System',
    description: 'A distributed instant messaging server handling 100k+ concurrent websocket connections.',
    files: {
      'src/main.zy': {
        name: 'main.zy',
        language: 'origami',
        isEntry: true,
        content: `use std/net/websocket;
use std/sync;

// Global channel map for broadcasting
$hub = new sync\\Map();

function handle_ws($conn) {
    $userId = $conn->query("uid");
    $hub->set($userId, $conn);
    
    defer $hub->delete($userId);
    
    // Efficient message loop
    foreach ($conn->messages() as $msg) {
        if ($msg->type == "dm") {
             $target = $hub->get($msg->to);
             if ($target) {
                 // Zero-copy forwarding
                 $target->send($msg->payload);
             }
        } else {
             // Broadcast using lightweight actor spawning
             spawn broadcast($msg);
        }
    }
}

function broadcast($msg) {
    foreach ($hub as $conn) {
        $conn->send($msg);
    }
}

function main() {
    websocket::listen(":8888", handle_ws);
}`
      }
    }
  },
  {
    id: 'performance-api',
    name: 'Ultra-Fast API',
    description: 'REST API endpoint achieving Go-level throughput with PHP-like simplicity.',
    files: {
      'src/api.zy': {
        name: 'api.zy',
        language: 'origami',
        isEntry: true,
        content: `use std/http;
use go/encoding/json; // Use Go's native JSON for max speed

struct User {
    public int $id;
    public string $name;
}

// Pre-compile routing tree
$router = new http\\Router();

$router->get("/users/:id", function($req) {
    // Database connection pool is managed by runtime
    $user = db::query("SELECT * FROM users WHERE id = ?", $req->params["id"]);
    
    // Direct struct to JSON stream
    return http::json($user);
});

function main() {
    // Enable multi-core scheduling
    runtime::GOMAXPROCS(8);
    
    echo "Server starting on :3000...";
    http::listenAndServe(":3000", $router);
}`
      }
    }
  }
];

export const SHOWCASE_PROJECTS = {
  en: [
    {
      id: 1,
      title: "Cosmos Desktop",
      description: "Cross-platform creative suite built with Origami WebView. Merges Web UI flexibility with native Go performance.",
      image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
      tags: ["GUI", "WebView", "Desktop"],
      author: "CreativeLabs"
    },
    {
      id: 2,
      title: "Bolt IM",
      description: "Enterprise-grade chat infrastructure supporting 1M+ concurrent users per node with sub-millisecond latency.",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
      tags: ["IM", "WebSocket", "Concurrency"],
      author: "ConnectTech"
    },
    {
      id: 3,
      title: "HyperScale API",
      description: "Payment processing gateway handling $5B daily transaction volume. Replaced legacy Java stack with 1/10th resources.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      tags: ["FinTech", "High Performance", "API"],
      author: "FinCore"
    },
    {
      id: 4,
      title: "Nebula Engine",
      description: "Real-time game server engine utilizing Actor model for zero-lock physics synchronization.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      tags: ["Game Server", "Actor Model", "Real-time"],
      author: "PixelForge"
    }
  ],
  zh: [
    {
      id: 1,
      title: "Cosmos Desktop (宇宙桌面)",
      description: "使用 Origami WebView 构建的跨平台创意套件。融合了 Web UI 的灵活性与原生 Go 的高性能。",
      image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
      tags: ["GUI", "WebView", "桌面应用"],
      author: "CreativeLabs"
    },
    {
      id: 2,
      title: "Bolt IM (闪电通讯)",
      description: "企业级聊天基础设施，单节点支持 100 万+ 并发用户，延迟低于 1 毫秒。",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
      tags: ["即时通讯", "WebSocket", "高并发"],
      author: "ConnectTech"
    },
    {
      id: 3,
      title: "HyperScale API (超大规模网关)",
      description: "日处理 50 亿美元交易额的支付网关。替代了旧的 Java 技术栈，仅使用 1/10 的资源。",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      tags: ["金融科技", "高性能", "API"],
      author: "FinCore"
    },
    {
      id: 4,
      title: "Nebula Engine (星云引擎)",
      description: "利用 Actor 模型实现零锁物理同步的实时游戏服务器引擎。",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      tags: ["游戏服务器", "Actor 模型", "实时"],
      author: "PixelForge"
    }
  ]
};

export const CODE_EXAMPLES = {
  en: [
    {
      category: "GUI Development",
      title: "WebView Application",
      description: "Create a desktop app with HTML UI and Go backend.",
      code: `use std/webview;

function main() {
    // Initialize WebView with debug enabled
    $w = webview::create(true);
    $w->setTitle("Origami App");
    $w->setSize(800, 600);

    // Bind PHP/Origami function to JS 'greet'
    $w->bind("greet", function($name) {
        return "Hello " . $name . " from Origami Core!";
    });

    $w->navigate("data:text/html,
        <button onclick='callBackend()'>Click Me</button>
        <script>
            async function callBackend() {
                const res = await window.greet('User');
                alert(res);
            }
        </script>
    ");
    
    $w->run();
}`
    },
    {
      category: "High Concurrency",
      title: "IM WebSocket Server",
      description: "Handle thousands of connections with goroutines.",
      code: `use std/net/websocket;

function main() {
    $server = websocket::listen(":8080");
    
    foreach ($server->accept() as $conn) {
        // Spawn a goroutine for each connection
        spawn function($c) {
            defer $c->close();
            
            while ($msg = $c->read()) {
                // Broadcast to all other users (pseudo-code)
                // Channel operations are thread-safe by default
                Hub::broadcast($msg);
            }
        }($conn);
    }
}`
    },
    {
      category: "System API",
      title: "Performance Benchmark",
      description: "Simple HTTP benchmark endpoint.",
      code: `use std/http;

function main() {
    http::handle("/bench", function($w, $r) {
        // Zero-allocation response
        $w->write("OK");
    });
    
    // Utilizes all CPU cores automatically
    echo "Bench server running on :3000";
    http::listen(":3000");
}`
    }
  ],
  zh: [
    {
      category: "GUI 开发",
      title: "WebView 桌面应用",
      description: "使用 HTML UI 和 Go 后端创建桌面应用。",
      code: `use std/webview;

function main() {
    // 初始化 WebView，启用调试
    $w = webview::create(true);
    $w->setTitle("Origami App");
    $w->setSize(800, 600);

    // 将 PHP/Origami 函数绑定到 JS 的 'greet'
    $w->bind("greet", function($name) {
        return "Hello " . $name . " from Origami Core!";
    });

    $w->navigate("data:text/html,
        <button onclick='callBackend()'>Click Me</button>
        <script>
            async function callBackend() {
                const res = await window.greet('User');
                alert(res);
            }
        </script>
    ");
    
    $w->run();
}`
    },
    {
      category: "高并发",
      title: "IM WebSocket 服务器",
      description: "使用 Goroutine 处理数千个连接。",
      code: `use std/net/websocket;

function main() {
    $server = websocket::listen(":8080");
    
    foreach ($server->accept() as $conn) {
        // 为每个连接生成一个 Goroutine
        spawn function($c) {
            defer $c->close();
            
            while ($msg = $c->read()) {
                // 广播给所有其他用户 (伪代码)
                // Channel 操作默认是线程安全的
                Hub::broadcast($msg);
            }
        }($conn);
    }
}`
    },
    {
      category: "系统 API",
      title: "性能基准测试",
      description: "简单的 HTTP 基准测试端点。",
      code: `use std/http;

function main() {
    http::handle("/bench", function($w, $r) {
        // 零内存分配响应
        $w->write("OK");
    });
    
    // 自动利用所有 CPU 核心
    echo "Bench server running on :3000";
    http::listen(":3000");
}`
    }
  ]
};
