//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/php-any/origami/parser"
	"github.com/php-any/origami/runtime"
	"github.com/php-any/origami/std"
	"github.com/php-any/origami/std/php"
	"github.com/php-any/origami/std/system"
)

// 每次运行都会创建全新的解析器与 VM；此处不复用全局实例
var ()

func initVM() {}

// run(code: string) => string
// 返回：若程序有返回值则返回该值字符串；若无返回值或出错，返回空串或错误信息（前缀 Error: ...）
func run(this js.Value, args []js.Value) any {
    initVM()
	if len(args) < 1 {
		return "Error: missing code"
	}
	code := args[0].String()

    // 每次运行都创建全新的解析器与 VM 环境
    p := parser.NewParser()
    // 避免相对路径命名空间在 WASM 下触发 getwd 错误
    p.ClassPathManager = parser.NewDefaultClassPathManager()
    vmAny := runtime.NewVM(p)
    std.Load(vmAny)
    php.Load(vmAny)
    system.Load(vmAny)

	program, ctl := p.ParseString(code, "inmem.zy")
	if ctl != nil {
        // 直接返回可读错误信息
        return ctl.AsString()
	}

    // 重定向 stdout 到返回字符串 (模拟)
    // 在真实 WASM 环境中，os.Stdout 通常被重定向到 console.log (通过 wasm_exec.js)
    // 我们这里不需要做特殊处理，因为 wasm_exec.js 已经处理了 fd 1/2
    // 如果需要捕获输出返回给前端，需要更复杂的 pipe 处理，或者让前端拦截 console.log

    val, c := program.GetValue(vmAny.CreateContext(p.GetVariables()))
	if c != nil {
        return c.AsString()
	}
	if s, ok := val.(interface{ AsString() string }); ok {
		return s.AsString()
	}
	// 无返回值时返回空串
	return ""
}

func main() {
	initVM()
	// 暴露全局函数
	js.Global().Set("origamiRun", js.FuncOf(run))
	// 保持运行
	select {}
}

