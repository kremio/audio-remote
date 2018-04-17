<template>
	<div ref="root" class="container">
		<span v-on:click="toggle" v-bind:class='{one: oneBar, two: twoBar, three: threeBar, four: fourBar, five: fiveBar }'>
			<i></i>
			<i></i>
			<i></i>
			<i></i>
			<i></i>
		</span>
		<div v-if="show" class="slider">
			<vertical-slider v-model="volume" min="0" max="150"/>
		</div>
	</div>
</template>

<script>
import VerticalSlider from "./VerticalSlider.vue"

export default {
	data: ()=>({
		show: false,
		mousedownHandler: undefined
	}),
	computed: {
		oneBar(){
			return this.volume >= 25
		},
		twoBar(){
			return this.volume >= 50
		},
		threeBar(){
			return this.volume >= 75
		},
		fourBar(){
			return this.volume >= 100
		},
		fiveBar(){
			return this.volume >= 125
		},
		volume: {
			get(){
				return this.$store.state.volume
			},
			set(value){
				this.$store.dispatch('setVolume', value)
			}
		}
	},
	methods:{
		toggle: function(){
			this.show = !this.show
			if( this.show ){
				this.mousedownHandler = this.onMousedown.bind(this)
				document.addEventListener( 'mousedown', this.mousedownHandler )
			}else{
				document.removeEventListener( 'mousedown', this.mousedownHandler )
				this.mousedownHandler = undefined
			}
		},
		onMousedown: function(e){
//			console.log( "mousdown", e.target )
			const findRoot = (el) => {
				if(el == this.$refs.root){
					return true
				}
				if( !el.parentElement ){
				return false
				}
				return findRoot(el.parentElement)
			}
			if( !findRoot(e.target) ){
				this.toggle()
			}
		}
	},
	mounted(){
		this.$store.dispatch('getVolume')
	},
	components:{
		VerticalSlider
	}
}
</script>

<style scoped>
.container {
	position: relative;
	letter-spacing: 0;
}
 .slider {
	 height: 400px;
	 width: 100%;
	 position:absolute;
	 top: 100%;
	 left: 0;
	 background: black;
	 padding: 10px 0;
 }

 i {
	 display: inline-block;
	 background-color: rgb(39,39,39);
	 width: 2px;
	 height: 50%;
	 border: 1px solid rgb(85,85,85);
	 vertical-align: middle;
	 transform-origin: 0 100%;
 }

 i:first-child{
	 transform: scaleY(0.2);
 }
 .one i:first-child{
	 background-color: white;
 }

  i:nth-child(2){
	 transform: scaleY(0.4);
 }

 .two i:nth-child(2){
	 background-color: white;
 }

 
  i:nth-child(3){
	 transform: scaleY(0.6);
 }


 .three i:nth-child(3){
	 background-color: white;
 }

 
  i:nth-child(4){
	 transform: scaleY(0.8);
 }

 .four i:nth-child(4){
	 background-color: white;
 }

 .five i{
	 background-color: white;
 }

</style>
