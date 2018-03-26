<template>
	<div v-bind:class="{seeking: isSeeking}">
		<input type="range" v-model="time" v-on:change="seek" min="0" v-bind:max="duration" step="0.5">
		<span class="time">{{ formattedTime }}</span>
		<span class="duration">{{ formattedDuration }}</span>
	</div>
</template>

<script>

function secondsToMinuteSeconds( durationSeconds ){
	const minutes = Math.floor( durationSeconds/60)
	durationSeconds -= minutes * 60
	const seconds = Math.floor(durationSeconds)
	const remainder = (durationSeconds - seconds).toFixed(2) * 100
	return `${(""+minutes).padStart(2,0)}:${(""+seconds).padStart(2,0)}.${(""+remainder).padStart(2,0)}`
}

export default {
	props:{duration: Number},
	computed: {
		time: {
			get(){
				return this.$store.state.player.timeSeconds
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
	}
}
</script>

<style scoped>
.seeking .time{
	font-weight: bold;
}
</style>
