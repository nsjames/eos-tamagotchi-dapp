<nav>
    <section>
        <img class="logo" src={bubbleLogo} />
    </section>
    <section>

        {#if !loggedIn}
            <button on:click={WalletService.login}>Login</button>
        {:else}
            <button on:click={WalletService.logout}>Logout</button>
        {/if}
    </section>
</nav>

<section class="tamagotchi">
    <section class="info">
        <img src={tamagotchiImage} />

        {#if !loggedIn}
            <section class="panel">
                Welcome to the <b>Tamagotchi</b> game!

                <br />
                <br />

                Click the "Login" button on the top right to sign in
                and start playing.
            </section>
        {:else}
            {#if !$tamagotchi}
                <section class="panel">
                    First time here, eh?

                    <br />
                    <br />

                    Alright noob, let's get you started.
                    <br />
                    <br />

                    <button on:click={WalletService.create}>Start Game</button>
                </section>
            {:else}
                {#if isDead}
                    <section class="panel">
                        Your <b>Tamagotchi</b> has <b style="color: red;">died</b>!

                        <br />
                        <br />

                        <img src="https://media3.giphy.com/media/XhcSIUIkgbmuY/giphy.gif?cid=ecf05e472wp8jypot62mjfhqkpz6xokfe225wlyx617i2uo5&ep=v1_gifs_search&rid=giphy.gif&ct=g">

                        <br />

                        <button on:click={WalletService.create}>Restart Game</button>
                    </section>
                {:else}
                    <section class="panel">
                        {#if $showingConfetti}
                            <Confetti x={[-4, 4]} y={[-2, 2]} amount=200 />
                        {/if}

                        <section class="status-bar">
                            <label><span>Food</span></label>
                            <figure style="width: 68%; background: red;"></figure>
                        </section>
                        
                        <section class="status-bar">
                            <label><span>Happiness</span></label>
                            <figure style="width: 72%; background: lightgreen;"></figure>
                        </section>

                        <section class="flex gap-3">
                            <button on:click={WalletService.feed}>Feed</button>
                            <button on:click={WalletService.play}>Play</button>
                        </section>
                    </section>
                {/if}
                
            {/if}
            
        {/if}

        
        
    </section>
</section>

<script lang="ts">
    import tamagotchiImage from "$lib/images/tamagotchi.png"
    import bubbleLogo from "$lib/images/bubble_logo.png";
    import WalletService, { session, tamagotchi, showingConfetti } from "../services/Wallet.service";
    import { Confetti } from "svelte-confetti";
    import { onMount } from "svelte";

    onMount(() => {
        WalletService.init();
    });

    $: loggedIn = !!$session;
    $: isDead = $tamagotchi && ($tamagotchi.calculated_food <= 0 || $tamagotchi.calculated_happiness <= 0);

    setInterval(() => {
        if($tamagotchi){
            WalletService.refreshTamagotchi(false)
        }
    }, 1000)

</script>

<style lang="scss">
    nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 20px;
        display: flex;
        justify-content: space-between;

        .logo {
            width: 230px;
            filter: invert(1);

            animation: expandAndContract 2s infinite;

            @keyframes expandAndContract {
                0% {
                    transform: scale(1) rotate(-3deg);
                }
                50% {
                    transform: scale(1.05) rotate(-3deg) translateX(5px);
                }
                100% {
                    transform: scale(1) rotate(-3deg);
                }
            }

        }
    }

    button {
        background: #333;
        font-size: 13px;
        color: #fff;
        height: 40px;
        padding: 0 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
    }

    .tamagotchi {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;

        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 30s ease infinite;

        @keyframes gradient {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }

        .info {
            display: flex;
            align-items: center;

            img {
                width: 300px;
            }

            .panel {
                padding: 20px;
                background: #fff;
                width: 300px;
                border-radius: 20px;;
                margin-left: -50px;
            }

            .status-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;

                border: 1px solid #333;
                border-radius: 4px;
                width: 100%;
                height: 50px;
                position: relative;
                overflow: hidden;
                padding: 2px;

                label {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    

                    span {
                        font-size: 12px;
                        font-weight: bold;
                        padding: 3px 6px;
                        background: white;
                        color: #333;
                        border-radius: 4px;
                    }
                }

                figure {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s ease;
                }
                
            }
        }
    }
</style>