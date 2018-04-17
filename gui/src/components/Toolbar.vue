<template>
	<div class="toolbar">
		<div class="main-container">
			<p v-if="!cdAvailable">No CD !</p>
			<button v-if="cdAvailable" v-on:click="eject" class="button">Eject</button>
			<volume-control v-if="cdAvailable" class="button"/>
		</div>
	</div>
</template>

<script>
import Cd from "../api/cd.js"
import VolumeControl from "./VolumeControl.vue"

export default {
	computed: {
		cdAvailable(){
			return this.$store.state.cd.available
		}
	},

	methods:{
		eject: function(){
			Cd.eject()
		}
	},
	mounted(){
		this.$store.dispatch('cd/checkStatus')
		//Poll CD state every second
		setInterval(() => {
			if( !document.hasFocus() ){
				return
			}
			this.$store.dispatch('cd/checkStatus')
		}, 1000)
	},
	components: {
		VolumeControl
	}
}
</script>

<style scoped>

	.toolbar{
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1;
		width: 100%;
		height: 3em;
		line-height: 3em;
		background-color: transparent;
		font-family: 'Open Sans Condensed', sans-serif;
	}
	
 .main-container {
	 height: 100%;
   background: linear-gradient(to bottom, rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%);
   text-align: center;
 }

 p {
	 margin: 0;
	 color: white;
 }

 .button{
	 background: transparent;
	 display:inline-block;
	 border-radius: 0;
	 height: 100%;
	 color: white;
	 border: 1px solid rgb(85,85,85);
	 border-top: none;
	 border-bottom: none;
	 padding: 0 10px;
	 vertical-align: top;
	 font-size: 0.8em;
	 letter-spacing: 2px;
	 transition: font-size 0.5s;
	 font-weight: 400;
   font-family: inherit;
 }

 .button:hover{
   background-color: rgba(255,255,255,0.22);
		font-size: 1.5em;
		cursor: pointer;
 }
</style>
