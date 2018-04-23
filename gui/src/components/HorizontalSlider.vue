<template src="./Slider.html"></template>

<script>
import SliderMixin from "./SliderMixin.vue"

export default {
	mixins:[SliderMixin],
	data: ()=>({
		guideMetric: "offsetWidth",
		handleMetric: "offsetWidth",
		handlePositionAttr: "left",
		mouseEventPositionAttr: "clientX",
		mouseEventOffsetAttr: "offsetX"
	})
}
</script>

<style scoped>
	div {
		position: relative;
		width:100%;
		height:4px;
		background-color: rgba(0,183,234);
		margin: 0 auto;
		border-radius: 2px;
	}

	span {
		display: block;
		height: 30px;
		width: 10px;
		background-color: grey;
		position: absolute;
		top: 50%;
		margin-top: -15px;
	}
</style>
