<template>
	<div>
		<time-scroller v-if="trackDuration" v-bind:duration='trackDuration'/>
		<div class="button-group">
			<button v-on:click="previous" class="previous">|<</button>
			<button v-on:click="playPause">{{ playing ? "||" : ">" }}</button>
			<button v-on:click="next" class="next">>|</button>
		</div>
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
	.button-group{
		text-align: center;
		padding: 30px 0;
		background: black;
		color: white;
	}

	.button-group button {
		border: none;
		font-size: 30px;
		font-weight: bold;
		width: 70px;
		margin: 0;
		padding: 0;
		color: inherit;
		background: none;
	}

	.previous, .next {
		letter-spacing: -6px;
	}
</style>
