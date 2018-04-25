<template src="./Slider.html"></template>

<script>
import SliderMixin from "./SliderMixin.vue"

export default {
	mixins:[SliderMixin],
	data: ()=>({
		guideMetric: "offsetHeight",
		handleMetric: "offsetHeight",
		handlePositionAttr: "top",
		pointerPositionAttr: "pageY"
	})
}
</script>

<style lang="scss" scoped>
  @import "scss/colours.scss";

	div {
		height:100%;
		position: relative;
		width:4px;
		background-color: $blue;
		margin: 0 auto;
		border-radius: 2px;
	}

	span {
		display: block;
		width: 30px;
		height: 10px;
		background-color: grey;
		position: absolute;
		left: 50%;
		margin-left: -15px;
	}
</style>
