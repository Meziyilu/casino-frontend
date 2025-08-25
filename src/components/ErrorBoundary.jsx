import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("UI ErrorBoundary:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, background:"#fff7f7", color:"#b91c1c", border:"1px solid #fecaca", borderRadius: 8 }}>
          <b>畫面渲染發生錯誤</b>
          <pre style={{ whiteSpace:"pre-wrap" }}>{String(this.state.error?.message || this.state.error)}</pre>
          <div style={{ fontSize:12, opacity:.75 }}>詳細請看 Console（F12）</div>
        </div>
      );
    }
    return this.props.children;
  }
}
