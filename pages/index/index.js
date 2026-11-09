const COLORS = ['#347653', '#e8a34a', '#719bb1', '#d8755c'];
const LABELS = ['出行', '饮食', '日常用能', '吸烟'];

function makePickerOptions(labels, values) {
  return labels.map((label, index) => ({ label, value: values[index] }));
}

Page({
  data: {
    weight: '65',
    height: '170',
    distance: '18',
    transportIndex: 2,
    dietIndex: 1,
    mealsIndex: 1,
    cigs: 0,
    transportOptions: makePickerOptions(['步行 / 骑行', '公交 / 地铁', '网约车 / 汽车', '混合出行'], [0.04, 0.05, 0.21, 0.12]),
    dietOptions: makePickerOptions(['以植物性食物为主', '荤素均衡', '肉类较多'], [1.2, 2.5, 3.8]),
    mealsOptions: makePickerOptions(['1–2 餐', '3 餐', '4 餐及以上'], [2, 3, 4]),
    today: '',
    total: '—',
    chartTotal: '—',
    trees: '—',
    breath: '—',
    comparison: '',
    legend: [],
    showToast: false
  },

  onLoad() {
    const now = new Date();
    this.setData({ today: `${now.getMonth() + 1}月${now.getDate()}日` });
    this.calculate();
  },

  onInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [key]: event.detail.value }, () => this.calculate());
  },

  onPickerChange(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [key]: Number(event.detail.value) }, () => this.calculate());
  },

  onCigsChange(event) {
    this.setData({ cigs: Number(event.detail.value) }, () => this.calculate());
  },

  calculate() {
    const weight = Math.max(25, Number(this.data.weight) || 65);
    const height = Math.max(100, Number(this.data.height) || 170);
    const km = Math.max(0, Number(this.data.distance) || 0);
    const transportFactor = Number(this.data.transportOptions[this.data.transportIndex].value);
    const dietFactor = Number(this.data.dietOptions[this.data.dietIndex].value);
    const mealCount = Number(this.data.mealsOptions[this.data.mealsIndex].value);
    const parts = [km * transportFactor, dietFactor * mealCount, 0.72, Number(this.data.cigs) * 0.014];
    const total = parts.reduce((sum, value) => sum + value, 0);
    const breath = weight * 0.0095 * Math.pow(height / 170, 0.15);
    const comparison = total < 4
      ? '你的估算值较低，继续保持轻盈的日常选择。'
      : total < 8
        ? '这大约相当于一杯外带咖啡的重量级别。'
        : '出行和饮食是可以优先留意的两个部分。';
    const legend = parts.map((value, index) => ({
      label: LABELS[index],
      value: value.toFixed(1),
      color: COLORS[index],
      width: total ? `${(value / total * 100).toFixed(2)}%` : '0%'
    }));
    this.setData({
      total: total.toFixed(1),
      chartTotal: total.toFixed(1),
      trees: (total / 22 * 365).toFixed(1),
      breath: breath.toFixed(2),
      comparison,
      legend
    });
  },

  updateResult() {
    this.calculate();
    this.setData({ showToast: true });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.setData({ showToast: false }), 1600);
  },

  resetForm() {
    this.setData({
      weight: '65', height: '170', distance: '18',
      transportIndex: 2, dietIndex: 1, mealsIndex: 1, cigs: 0
    }, () => this.calculate());
  },

  onUnload() {
    clearTimeout(this.toastTimer);
  }
});

