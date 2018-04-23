<template>
	<div v-bind:class="{seeking: isSeeking}" class="container">
		<div class="slider">
			<horizontal-slider v-model="time" v-on:change="seek" v-bind:min="0" v-bind:max="duration" step="0.5"/>
		</div>
		<span class="time">{{ formattedTime }}</span>
		<span class="duration">{{ formattedDuration }}</span>
	</div>
</template>

<script>

import HorizontalSlider from "./HorizontalSlider.vue"

function secondsToMinuteSeconds( durationSeconds ){
	const minutes = Math.floor( durationSeconds/60)
	durationSeconds -= minutes * 60
	const seconds = Math.floor(durationSeconds)
	const remainder = (durationSeconds - seconds).toFixed(2) * 100
	return `${(""+minutes).padStart(2,0)}:${(""+seconds).padStart(2,0)}`
//	return `${(""+minutes).padStart(2,0)}:${(""+seconds).padStart(2,0)}.${(""+remainder).padStart(2,0)}`
}

export default {
	props:{duration: Number},
	computed: {
		time: {
			get(){
				return Number(this.$store.state.player.timeSeconds)
			},
			set(value){
				this.$store.commit('player/setTemporaryTime', value)
			}
		},
		formattedDuration(){
			return secondsToMinuteSeconds( this.duration )
		},
		formattedTime(){
			return secondsToMinuteSeconds( this.time )
		},
		isSeeking(){
			return this.$store.state.player.temporaryTime
		}
	},
	methods: {
		seek: function(){
			this.$store.dispatch('player/seek')
		}
	},
	components:{
		HorizontalSlider
	}
}
</script>

<style scoped>
 .slider{
	 position: relative;
	 box-sizing: border-box;
	 width: 100%;
	 background: black;
	 padding: 25px 10px;
 }

.seeking .time{
	transform: scale(1.3);
	color: rgb(0,183,234);
}

.time, .duration {
	font-family: 'Open Sans Condensed', sans-serif;
	color: white;
	position: relative;
	padding: 0 10px;
	top: -1.5em;
	font-size: 0.8em;
	transition: transform 0.5s;
	transform-origin: 50% 50%;
	text-align: center;
}

.time {
	float: left;
}

.duration {
	float: right;
}

</style>
