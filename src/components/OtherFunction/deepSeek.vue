<template>
  <div class="chat-container">
    <div class="chat-messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="message.role === 'user' ? 'user-message' : 'bot-message'"
      >
        <p>{{ message.content }}</p>
      </div>
      <!-- 加载提示 -->
      <div v-if="isLoading" class="loading-message">
        <p>正在等待 AI 回复，请稍候...</p>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="输入消息"
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">
        {{ isLoading ? "正在发送..." : "发送" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      inputMessage: "",
      socket: null,
      isLoading: false, // 新增加载状态
    };
  },
  mounted() {
    // 建立WebSocket连接
    this.socket = new WebSocket("ws://localhost:3001");

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    this.socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      this.messages.push(response);
      this.isLoading = false; // 收到消息后，取消加载状态
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };
  },
  methods: {
    sendMessage() {
      if (this.inputMessage.trim() === "") return;

      const userMessage = {
        role: "user",
        content: this.inputMessage,
      };
      this.messages.push(userMessage);
      this.socket.send(JSON.stringify(userMessage));
      this.inputMessage = "";
      this.isLoading = true; // 发送消息后，开启加载状态
    },
  },
  beforeDestroy() {
    // 关闭WebSocket连接
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.user-message {
  text-align: right;
  margin-bottom: 10px;
}

.user-message p {
  display: inline-block;
  background-color: #dcf8c6;
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 70%;
}

.bot-message {
  text-align: left;
  margin-bottom: 10px;
}

.bot-message p {
  display: inline-block;
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 70%;
}

.chat-input {
  display: flex;
  padding: 10px;
  background-color: #eee;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

.chat-input button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #0056b3;
}

.loading-message {
  text-align: center;
  color: #888;
}
</style>