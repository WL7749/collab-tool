const { exec } = require('child_process');
const net = require('net');

console.log('=================================');
console.log('MySQL连接诊断工具');
console.log('=================================\n');

// 1. 检查端口
console.log('1. 检查3306端口状态...');
const socket = new net.Socket();
socket.setTimeout(2000);

socket.on('connect', () => {
  console.log('   ✅ 端口3306是开放的');
  console.log('   💡 MySQL服务正在运行\n');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('   ❌ 端口3306连接超时');
  console.log('   💡 MySQL服务可能未启动\n');
  socket.destroy();
});

socket.on('error', (err) => {
  console.log('   ❌ 无法连接到端口3306');
  console.log(`   错误: ${err.message}`);
  console.log('   💡 MySQL服务未运行或端口不正确\n');
  socket.destroy();
});

socket.connect(3306, 'localhost');

// 2. 检查MySQL服务
setTimeout(() => {
  console.log('2. 检查MySQL服务...');
  exec('sc query | findstr /i mysql', (error, stdout) => {
    if (stdout) {
      console.log('   找到以下MySQL服务:');
      stdout.split('\n').forEach(line => {
        if (line.trim()) console.log(`   - ${line.trim()}`);
      });
      console.log('\n💡 尝试启动服务: net start [服务名]\n');
    } else {
      console.log('   ❌ 未找到MySQL服务');
      console.log('   💡 可能未安装MySQL\n');
    }

    // 3. 检查MySQL安装
    console.log('3. 检查MySQL安装...');
    exec('where mysql', (error, stdout) => {
      if (stdout) {
        console.log('   ✅ MySQL已安装:');
        stdout.split('\n').forEach(line => {
          if (line.trim()) console.log(`   - ${line.trim()}`);
        });
      } else {
        console.log('   ❌ 未找到MySQL');
        console.log('   💡 请先安装MySQL\n');
      }

      console.log('\n=================================');
      console.log('诊断完成！');
      console.log('=================================');
    });
  });
}, 2000);