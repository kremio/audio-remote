<template>
	<div>
		<time-scroller v-if="trackDuration" v-bind:duration='trackDuration'/>
		<button v-on:click="previous">|<</button>
		<button v-on:click="playPause">{{ playing ? "||" : ">" }}</button>
		<button v-on:click="next">>|</button>
	</div>
</template>

<script>
import Player from "../api/player.js"
import PlayList from "../api/playlist.js"
import TimeScroller from "./TimeScroller.vue"

export default {
	computed: {
		playing(){
			return this.$store.state.player.playing
		},
		trackDuration(){
			return Number(this.$store.state.player.duration)
		}
	},
	methods: {
		playPause: function(){
			Player.playPause()
		},
		previous: function(){
			PlayList.previous()
		},
		next: function(){
			PlayList.next()
		}
	},
	components:{
		TimeScroller
	},
	mounted(){
		this.$store.dispatch('player/checkStatus')
		//Poll CD state every second
		setInterval(() => {
			if( !document.hasFocus() || this.$store.state.player.temporaryTime ){
				return
			}
			this.$store.dispatch('player/checkStatus')
		}, 1000)

	}
}
</script>


<style scoped>

</style>
